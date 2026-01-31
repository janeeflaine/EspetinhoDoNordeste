
import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../supabase';
import { StoreMessage, StoreSchedule } from '../types';
import { Clock, GripVertical, Plus, Trash2, CalendarRange, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

// --- Draggable Message Card ---
const DraggableMessage = ({ message, isOverlay = false }: { message: StoreMessage; isOverlay?: boolean }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `message-${message.id}`,
        data: { message },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`p-3 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center gap-3 cursor-grab hover:border-zinc-500 transition-colors ${isOverlay ? 'shadow-2xl opacity-90 scale-105 z-50 cursor-grabbing' : ''}`}
        >
            <GripVertical className="text-zinc-500 w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{message.title}</h4>
                <p className="text-zinc-500 text-xs truncate">{message.message}</p>
            </div>
        </div>
    );
};

// --- Droppable Slot ---
const SlotDropZone = ({ schedule, onRemoveMessage }: { schedule: StoreSchedule, onRemoveMessage: (id: string) => void }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `slot-${schedule.id}`,
        data: { scheduleId: schedule.id },
    });

    const hasMessage = !!schedule.message_id;

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 h-20 rounded-lg border-2 border-dashed transition-all flex items-center justify-center p-2
                ${isOver ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-zinc-900/50'}
                ${hasMessage ? 'border-none bg-zinc-800' : ''}
            `}
        >
            {/* If Slot HAS Message (Closed with Reason) */}
            {hasMessage ? (
                <div className="w-full h-full bg-red-900/20 border border-red-900/50 rounded flex items-center justify-between px-3">
                    <div className="flex flex-col">
                        <span className="text-red-400 font-bold text-xs uppercase">Fechado</span>
                        <span className="text-zinc-400 text-xs">Mensagem ID: {schedule.message_id?.split('-')[0]}...</span>
                    </div>
                    <button
                        onClick={() => onRemoveMessage(schedule.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                /* Empty Slot = OPEN */
                <div className="text-center">
                    <span className="text-green-500 font-bold text-sm block">LOJA ABERTA</span>
                    <span className="text-zinc-600 text-xs">(Arraste uma msg para fechar)</span>
                </div>
            )}
        </div>
    );
};


export const StoreScheduler: React.FC = () => {
    const [messages, setMessages] = useState<StoreMessage[]>([]);
    const [schedules, setSchedules] = useState<StoreSchedule[]>([]);
    const [activeDragMessage, setActiveDragMessage] = useState<StoreMessage | null>(null);

    // New Slot State
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');

    // Initial Data Fetch
    useEffect(() => {
        fetchMessages();
        fetchSchedules();
    }, []);

    const fetchMessages = async () => {
        const { data } = await supabase.from('store_messages').select('*');
        if (data) setMessages(data);
    };

    const fetchSchedules = async () => {
        // Order by start_time
        const { data } = await supabase.from('store_schedules').select('*').order('start_time');
        if (data) setSchedules(data);
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.message) {
            setActiveDragMessage(event.active.data.current.message);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragMessage(null);

        if (over && active.data.current?.message) {
            const scheduleId = over.id.toString().replace('slot-', '');
            const messageId = active.data.current.message.id;

            // Update Optimistically
            setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, message_id: messageId, is_open: false } : s));

            // Update DB
            const { error } = await supabase.from('store_schedules').update({
                message_id: messageId,
                is_open: false
            }).eq('id', scheduleId);

            if (error) {
                alert("Erro ao atualizar agendamento.");
                fetchSchedules(); // Revert
            }
        }
    };

    const handleRemoveMessage = async (scheduleId: string) => {
        // Set back to OPEN (null message)
        setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, message_id: null, is_open: true } : s));

        const { error } = await supabase.from('store_schedules').update({
            message_id: null,
            is_open: true
        }).eq('id', scheduleId);

        if (error) fetchSchedules();
    };

    const handleAddSlot = async () => {
        if (!newStartTime || !newEndTime) return alert("Defina horário e início e fim");

        // Basic validation (start < end) - backend may need more complex 24h logic implementation or edge functions
        // For MVP assume simple daily slots

        const { data, error } = await supabase.from('store_schedules').insert([{
            start_time: newStartTime,
            end_time: newEndTime,
            is_open: true, // Default open untill message dragged
            message_id: null
        }]).select();

        if (error) {
            alert("Erro ao criar slot: " + error.message);
        } else if (data) {
            setSchedules(prev => [...prev, data[0]].sort((a, b) => a.start_time.localeCompare(b.start_time)));
            setNewStartTime('');
            setNewEndTime('');
        }
    };

    const handleDeleteSlot = async (id: string) => {
        if (!confirm("Excluir este horário?")) return;
        const { error } = await supabase.from('store_schedules').delete().eq('id', id);
        if (!error) {
            setSchedules(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">

                {/* LEFT COLUMN: Message Bank */}
                <div className="lg:col-span-1 bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 flex flex-col">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Clock className="text-red-500 w-5 h-5" />
                        Banco de Mensagens
                    </h3>
                    <p className="text-zinc-500 text-xs mb-4">
                        Arraste estas mensagens para os slots de horário à direita para programar o fechamento.
                    </p>

                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                        {messages.map(msg => (
                            <DraggableMessage key={msg.id} message={msg} />
                        ))}
                        {messages.length === 0 && <p className="text-zinc-600 italic text-center text-sm py-4">Nenhuma mensagem cadastrada.</p>}
                    </div>
                </div>

                {/* RIGHT COLUMN: Timeline Slots */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Add New Slot Control */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                        <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Início</label>
                            <input
                                type="time"
                                value={newStartTime}
                                onChange={e => setNewStartTime(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-white"
                            />
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs text-zinc-500 font-bold uppercase block mb-1">Fim</label>
                            <input
                                type="time"
                                value={newEndTime}
                                onChange={e => setNewEndTime(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-white"
                            />
                        </div>
                        <button
                            onClick={handleAddSlot}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Criar Horário</span>
                        </button>
                    </div>

                    {/* Timeline Visualization */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 min-h-[400px]">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <CalendarRange className="text-blue-500 w-5 h-5" />
                            Linha do Tempo (Diário)
                        </h3>

                        <div className="space-y-2">
                            {schedules.map(schedule => (
                                <div key={schedule.id} className="flex items-center gap-4 bg-zinc-900 p-2 rounded-lg border border-zinc-800 group">
                                    {/* Time Info */}
                                    <div className="w-24 text-center border-r border-zinc-800 pr-4">
                                        <div className="text-white font-mono font-bold">{schedule.start_time.slice(0, 5)}</div>
                                        <div className="text-zinc-600 text-xs font-mono">até</div>
                                        <div className="text-white font-mono font-bold">{schedule.end_time.slice(0, 5)}</div>
                                    </div>

                                    {/* Drop Zone */}
                                    <SlotDropZone schedule={schedule} onRemoveMessage={handleRemoveMessage} />

                                    {/* Delete Control */}
                                    <button
                                        onClick={() => handleDeleteSlot(schedule.id)}
                                        className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {schedules.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                                    <p className="text-zinc-500">Nenhum horário definido.</p>
                                    <p className="text-zinc-600 text-sm">Adicione intervalos acima (ex: 18:00 às 23:00).</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Drag Portal */}
            {createPortal(
                <DragOverlay>
                    {activeDragMessage ? <DraggableMessage message={activeDragMessage} isOverlay /> : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};
