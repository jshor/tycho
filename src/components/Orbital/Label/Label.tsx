import React from 'react';
import { Html } from '@react-three/drei';

interface Props {
    text: string;
    id: string;
    action: Record<string, any>;
    targetId?: string;
}

export default function Label({ text, id, action, targetId }: Props) {
    const isActive = id === targetId;
    const className = `label label--${isActive ? 'active' : 'inactive'}`;

    return (
        <Html>
            <div
                className={className}
                onClick={() => action.setActiveOrbital(id, text)}
                onMouseOver={() => action.addHighlightedOrbital(id)}
                onMouseOut={() => action.removeHighlightedOrbital(id)}>
                {text}
            </div>
        </Html>
    );
}
