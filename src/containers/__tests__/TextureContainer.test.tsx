import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import TextureContainer from '../TextureContainer';

describe('Texture Container', () => {
    const textures = [
        {
            url: 'myImage.jpg',
            slot: 'map'
        }
    ];

    let component;
    let textureContainer;

    beforeEach(() => {
        component = shallow(<TextureContainer
            textures={textures}
        />);
        textureContainer = component.instance();
    });

    describe('componentDidMount()', () => {
        it('should enqueue the given textures', () => {
            const spy = jest.spyOn(textureContainer, 'enqueueTextures');

            textureContainer.componentDidMount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(textures);
        });
    });

    describe('onTextureLoaded()', () => {
        it('should push the given texture to the arrya of loaded textures', () => {
            const texture = textures[0];

            textureContainer.loadedTextures = [];
            textureContainer.onTextureLoaded(texture);

            expect(textureContainer.loadedTextures).toHaveLength(1);
            expect(textureContainer.loadedTextures[0]).toEqual(texture);
        });
    });

    describe('enqueueTextures()', () => {
        let spy;

        beforeEach(() => {
            spy = jest.spyOn(textureContainer, 'loadTexture');
        });

        it('should call loadTexture for each texture in the list', () => {
            textureContainer.enqueueTextures(textures);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(textures.length);
        });

        it('should not call loadTexture if the param is not an array', () => {
            textureContainer.enqueueTextures();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('getTextures()', () => {
        let result;

        beforeEach(() => {
            textureContainer.loadedTextures = textures;
            result = textureContainer.getTextures();
        });

        it('should be an array having the same length of loadedTextures', () => {
            expect(result).toHaveLength(textures.length);
        });

        it('should set each entry to be a texture component', () => {
            expect(toJson(result)).toMatchSnapshot();
        });
    });

    describe('updateMaterial()', () => {
        beforeEach(() => {
            textureContainer.refs = {
                material: {
                    map: {}
                }
            };
        });

        it('should mark the map to require an update', () => {
            textureContainer.updateMaterial();
            expect(textureContainer.refs.material.needsUpdate).toEqual(true);
        });

        describe('when a map exists', () => {
            it('should mark the map to require an update', () => {
                textureContainer.updateMaterial();
                expect(textureContainer.refs.material.map.needsUpdate).toEqual(true);
            });
        });

        describe('when a map does not exist', () => {
            it('should have an undefined map', () => {
                textureContainer.refs.material.map = undefined;
                textureContainer.updateMaterial();

                expect(textureContainer.refs.material.map).not.toBeDefined();
            });
        });
    });

    describe('render()', () => {
        it('should render the texture container successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
