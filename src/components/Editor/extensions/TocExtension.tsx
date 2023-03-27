import type { CreateExtensionPlugin, ProsemirrorNode } from "remirror";
import { PlainExtension, extension } from "remirror";
import { DecorationSet } from '@remirror/pm/view';

export type TocInfo = {
    level: number;
    title: string;
    scrollView: () => void;
}

export interface TocOptions {
    tocCb?: (tocList: TocInfo[]) => void;
}

@extension<TocOptions>({ defaultOptions: { tocCb: () => { } } })
export class TocExtension extends PlainExtension<TocOptions> {
    get name() {
        return 'toc' as const;
    }

    createPlugin(): CreateExtensionPlugin {
        return {
            state: {
                init: (_, state) => {
                    let count = 0;
                    const timer = setInterval(() => {
                        count++;
                        if (count >= 50) {
                            clearInterval(timer);
                        }
                        if (this.store != undefined && this.store.view != undefined && this.store.view.nodeDOM != undefined) {
                            this.calcToc(state.doc);
                            clearInterval(timer);
                        }
                    }, 200);
                    return DecorationSet.empty;
                },
                apply: (tr, old) => {
                    if (this.options.tocCb == undefined) {
                        return old;
                    }
                    if (tr.docChanged) {
                        let count = 0;
                        const timer = setInterval(() => {
                            count++;
                            if (count >= 50) {
                                clearInterval(timer);
                            }
                            if (this.store != undefined && this.store.view != undefined && this.store.view.nodeDOM != undefined) {
                                this.calcToc(tr.doc);
                                clearInterval(timer);
                            }
                        }, 200);
                        return old.map(tr.mapping, tr.doc);
                    }
                    return old;
                },
            },

            props: {
                decorations: (state) => {
                    return this.getPluginState(state);
                },
            },
        };
    }

    private calcToc(doc: ProsemirrorNode) {
        const tocList: TocInfo[] = [];
        doc.descendants((node, pos) => {
            if (node.type.name != "heading") {
                return true;
            }
            const lv = node.attrs.level;
            const title = node.textContent;
            const view = this.store.view;
            const dom = view.nodeDOM(pos) as HTMLElement;
            tocList.push({
                level: lv,
                title: title,
                scrollView: () => {
                    dom?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
                },
            });
            return false;
        });
        if (this.options.tocCb !== undefined && tocList.length > 0) {
            this.options.tocCb(tocList);
        }
    }
}