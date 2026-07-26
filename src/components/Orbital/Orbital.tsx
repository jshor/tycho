import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import Body from './Body';
import Label from './Label';
import { TextureMap, RingData } from '../../types';

interface Props {
    eclipticGroupRotation: THREE.Euler;
    orbitalGroupRotation: THREE.Euler;
    pathVertices: THREE.Vector3[];
    bodyPosition: THREE.Vector3;
    bodyRotation: THREE.Euler;
    radius: number;
    id: string;
    text: string;
    action: Record<string, any>;
    atmosphere?: number;
    pathOpacity?: number;
    scaleLastUpdate?: number;
    scale?: number;
    maps?: TextureMap[];
    targetId?: string;
    parentId?: string;
    isSatellite?: boolean;
    maxDistance?: number;
    camera?: any;
    rings?: RingData;
    children?: React.ReactNode;
}

export default function Orbital(props: Props) {
    const {
        eclipticGroupRotation,
        orbitalGroupRotation,
        pathVertices,
        bodyPosition,
        bodyRotation,
        atmosphere,
        pathOpacity,
        scaleLastUpdate,
        id,
        radius,
        rings,
        maps,
        scale,
        children,
    } = props;

    const lineColor = useMemo(
        () => new THREE.Color(atmosphere ?? 0xffffff),
        [atmosphere]
    );

    return (
        <group rotation={eclipticGroupRotation}>
            <group rotation={orbitalGroupRotation}>
                <group position={bodyPosition} name={id}>
                    <Body
                        rotation={bodyRotation}
                        radius={radius}
                        rings={rings}
                        maps={maps}
                        scale={scale}
                    />
                    <Label
                        text={props.text}
                        id={id}
                        action={props.action}
                        targetId={props.targetId}
                        parentId={props.parentId}
                        isSatellite={props.isSatellite}
                        maxDistance={props.maxDistance}
                    />
                    {children}
                </group>

                <Line
                    key={`path-${id}-${scaleLastUpdate}`}
                    points={pathVertices}
                    color={lineColor}
                    opacity={pathOpacity ?? 1}
                    transparent
                />
            </group>
        </group>
    );
}
