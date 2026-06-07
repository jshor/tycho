import React from 'react';
import { TextureLoader, FrontSide } from 'three';
import Constants from '../constants';
import { env } from '../utils/Environment';
import { TextureMap } from '../types';

interface LoadedTexture {
    url: string;
    slot?: string;
}

interface Props {
    side?: number;
    textures?: TextureMap[];
    transparent?: boolean;
}

export default class TextureContainer extends React.Component<Props> {

    loadedTextures: LoadedTexture[] = [];

    componentWillMount = () => {
        this.loadedTextures = [];
    }

    componentDidMount = () => {
        this.enqueueTextures(this.props.textures);
    }

    onTextureLoaded = (textureData: LoadedTexture) => {
        this.loadedTextures.push(textureData);
    }

    loadTexture = ({ url, slot }: TextureMap) => {
        const resolvedUrl = env(`/static/textures/map/${url}`);

        const loader = new TextureLoader();
        const cb = () => this.onTextureLoaded({ url: resolvedUrl, slot });
        const noop = () => { };

        loader.load(resolvedUrl, cb as any, noop, cb as any);
    }

    enqueueTextures = (textures?: TextureMap[]) => {
        if (Array.isArray(textures)) {
            textures.forEach(this.loadTexture);
        }
    }

    getTextures = () => {
        return this.loadedTextures.map(({ slot, url }, key) => (
            <texture
                url={url}
                slot={slot}
                key={key}
                onLoad={this.updateMaterial}
            />
        ));
    }

    updateMaterial = () => {
        const material: any = (this.refs as any).material;

        if (material.map) {
            material.map.needsUpdate = true;
        }
        material.needsUpdate = true;
    }

    render() {
        return (
            <meshLambertMaterial
                color={Constants.WebGL.MESH_DEFAULT_COLOR}
                children={this.getTextures()}
                transparent={this.props.transparent}
                side={this.props.side || FrontSide}
                ref="material"
            />
        );
    }
}
