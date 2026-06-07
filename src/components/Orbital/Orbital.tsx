import React from 'react';
import * as THREE from 'three';
import Body from './Body';
import Label from './Label';
import { TextureMap, RingData } from '../../types';

interface Props {
    eclipticGroupRotation: THREE.Euler;
    orbitalGroupRotation: THREE.Euler;
    pathVertices: THREE.Vector2[];
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
    maxDistance?: number;
    camera?: any;
    rings?: RingData;
    children?: React.ReactNode;
}

export default class Orbital extends React.Component<Props> {

    render() {
        return (
            <group ref="ecliptic" rotation={this.props.eclipticGroupRotation}>
                <group ref="orbital" rotation={this.props.orbitalGroupRotation}>
                    <group
                        position={this.props.bodyPosition}
                        name={this.props.id}>
                        <Body
                            rotation={this.props.bodyRotation}
                            radius={this.props.radius}
                            rings={this.props.rings}
                            maps={this.props.maps}
                            scale={this.props.scale}
                        />
                        <Label {...this.props} />
                        {this.props.children}
                    </group>

                    <line key={`path-${this.props.id}-${this.props.scaleLastUpdate}`}>
                        <lineBasicMaterial
                            transparent={true}
                            color={this.props.atmosphere}
                            opacity={this.props.pathOpacity}
                        />
                        <geometry
                            vertices={this.props.pathVertices}
                        />
                    </line>
                </group>
            </group>
        );
    }
}
