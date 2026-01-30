import React, { useEffect, useState } from 'react';
import { Facebook, Instagram, Youtube, Music2, Video, Globe } from 'lucide-react';
import { supabase } from '../supabase';
import { SocialLink } from '../types';

interface SocialFooterProps {
    className?: string;
    iconClassName?: string;
    showTitle?: boolean;
}

const IconMap: Record<string, any> = {
    'Facebook': Facebook,
    'Instagram': Instagram,
    'Youtube': Youtube,
    'Music2': Music2, // TikTok placeholder
    'Video': Video,   // Kwai placeholder
};

export const SocialFooter: React.FC<SocialFooterProps> = ({
    className = "",
    iconClassName = "w-6 h-6",
    showTitle = false
}) => {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const { data } = await supabase
                .from('social_links')
                .select('*')
                .eq('is_active', true)
                .neq('url', '') // valid urls only
                .order('platform');

            if (data) setLinks(data);
        } catch (error) {
            console.error("Error fetching social links:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || links.length === 0) return null;

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {showTitle && <h3 className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Siga nossas redes</h3>}
            <div className="flex items-center justify-center gap-6">
                {links.map((link) => {
                    const Icon = IconMap[link.icon_key] || Globe;
                    return (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-zinc-400 hover:text-amber-500 transition-all hover:scale-110 duration-200 ${iconClassName}`}
                            title={link.platform}
                        >
                            <Icon className="w-full h-full" />
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
