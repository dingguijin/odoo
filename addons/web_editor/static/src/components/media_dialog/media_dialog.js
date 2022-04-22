/** @odoo-module **/

import { useService } from '@web/core/utils/hooks';
import { useWowlService } from '@web/legacy/utils';
import { Dialog } from '@web/core/dialog/dialog';
import { ImageSelector } from './image_selector';
import { DocumentSelector } from './document_selector';
import { IconSelector } from './icon_selector';
import { VideoSelector } from './video_selector';

const { Component, useState, onRendered, xml } = owl;

export const TABS = {
    IMAGES: {
        id: 'IMAGES',
        title: "Images",
        Component: ImageSelector,
    },
    DOCUMENTS: {
        id: 'DOCUMENTS',
        title: "Documents",
        Component: DocumentSelector,
    },
    ICONS: {
        id: 'ICONS',
        title: "Icons",
        Component: IconSelector,
    },
    VIDEOS: {
        id: 'VIDEOS',
        title: "Videos",
        Component: VideoSelector,
    },
};

export class MediaDialog extends Dialog {
    setup() {
        super.setup();
        this.size = 'modal-xl';
        this.contentClass = 'o_select_media_dialog';
        this.title = this.env._t("Select a media");

        this.rpc = useService('rpc');
        this.orm = useService('orm');

        this.tabs = [];
        this.selectedMedia = useState({});

        this.initialIconClasses = [];

        this.addTabs();

        this.state = useState({
            activeTab: this.initialActiveTab,
        });
    }

    get initialActiveTab() {
        if (this.props.activeTab) {
            return this.props.activeTab;
        }
        if (this.props.media) {
            const correspondingTab = Object.keys(TABS).find(id => TABS[id].Component.tagNames.includes(this.props.media.tagName));
            if (correspondingTab) {
                return correspondingTab;
            }
        }
        return this.tabs[0].id;
    }

    addTab(tab, additionalProps = {}) {
        this.selectedMedia[tab.id] = [];
        this.tabs.push({
            ...tab,
            props: {
                ...tab.props,
                ...additionalProps,
                id: tab.id,
                resModel: this.props.resModel,
                resId: this.props.resId,
                media: this.props.media,
                multiImages: this.props.multiImages,
                selectedMedia: this.selectedMedia,
                selectMedia: (...args) => this.selectMedia(...args, tab.id, additionalProps.multiSelect),
                save: this.save.bind(this),
            },
        });
    }

    addTabs() {
        const onlyImages = this.props.onlyImages || this.props.multiImages || (this.props.media && this.props.media.parentElement && (this.props.media.parentElement.dataset.oeField === 'image' || this.props.media.parentElement.dataset.oeType === 'image'));
        const noDocuments = onlyImages || this.props.noDocuments;
        const noIcons = onlyImages || this.props.noIcons;
        const noVideos = onlyImages || this.props.noVideos;

        if (!this.props.noImages) {
            this.addTab(TABS.IMAGES, {
                useMediaLibrary: this.props.useMediaLibrary,
                multiSelect: this.props.multiImages
            });
        }
        if (!noDocuments) {
            this.addTab(TABS.DOCUMENTS);
        }
        if (!noIcons) {
            const fonts = TABS.ICONS.Component.initFonts();
            this.addTab(TABS.ICONS, {
                fonts,
            });

            if (this.props.media && TABS.ICONS.Component.tagNames.includes(this.props.media.tagName)) {
                const classes = this.props.media.className.split(/\s+/);
                const mediaFont = fonts.find(font => classes.includes(font.base));
                if (mediaFont) {
                    const selectedIcon = mediaFont.icons.find(icon => icon.names.some(name => classes.includes(name)));
                    if (selectedIcon) {
                        this.initialIconClasses.push(...selectedIcon.names);
                        this.selectMedia(selectedIcon, TABS.ICONS.id);
                    }
                }
            }
        }
        if (!noVideos) {
            this.addTab(TABS.VIDEOS, {
                vimeoPreviewIds: this.props.vimeoPreviewIds,
                isForBgVideo: this.props.isForBgVideo,
            });
        }
    }

    selectMedia(media, tabId, multiSelect) {
        if (multiSelect) {
            const isMediaSelected = this.selectedMedia[tabId].map(({ id }) => id).includes(media.id);
            if (!isMediaSelected) {
                this.selectedMedia[tabId].push(media);
            } else {
                this.selectedMedia[tabId] = this.selectedMedia[tabId].filter(m => m.id !== media.id);
            }
        } else {
            this.selectedMedia[tabId] = [media];
        }
    }

    async save() {
        const selectedMedia = this.selectedMedia[this.state.activeTab];
        if (selectedMedia.length) {
            const elements = await TABS[this.state.activeTab].Component.createElements(selectedMedia, { rpc: this.rpc, orm: this.orm });
            elements.forEach(element => {
                if (this.props.media) {
                    element.classList.add(...this.props.media.classList);
                    const style = this.props.media.getAttribute('style');
                    if (style) {
                        element.setAttribute('style', style);
                    }
                    if (this.props.media.dataset.shape) {
                        element.dataset.shape = this.props.media.dataset.shape;
                    }
                    if (this.props.media.dataset.shapeColors) {
                        element.dataset.shapeColors = this.props.media.dataset.shapeColors;
                    }
                }
                element.classList.add(...TABS[this.state.activeTab].Component.mediaSpecificClasses);
                for (const otherTab of Object.keys(TABS).filter(key => key !== this.state.activeTab)) {
                    element.classList.remove(...TABS[otherTab].Component.mediaSpecificClasses);
                }
                element.classList.remove(...this.initialIconClasses);
                element.classList.remove('o_modified_image_to_save');
                element.classList.remove('oe_edited_link');
            });
            if (this.props.multiImages) {
                this.props.save(elements);
            } else {
                this.props.save(elements[0]);
            }
        }
        this.close();
    }
}
MediaDialog.bodyTemplate = 'web_editor.MediaDialogBody';
MediaDialog.footerTemplate = 'web_editor.MediaDialogFooter';
MediaDialog.defaultProps = {
    useMediaLibrary: true,
};
MediaDialog.components = {
    ...Object.keys(TABS).map(key => TABS[key].Component),
};

export class MediaDialogWrapper extends Component {
    setup() {
        this.dialogs = useWowlService('dialog');

        onRendered(() => {
            this.dialogs.add(MediaDialog, {
                ...this.props,
                close: () => {
                    if (this.props.close) {
                        this.props.close();
                    }
                    this.destroy();

                },
            });
        });
    }
}
MediaDialogWrapper.template = xml``;
