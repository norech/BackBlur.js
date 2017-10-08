declare namespace BackBlur {
    interface Settings {
        [index: string]: any;
        selector?: string | Element | Element[];
        background_color?: string;
        apply_zindex?: boolean;
        blur_radius?: number;
        tmp_prefix?: string;
        cache?: boolean;
    }
}
declare var BackBlur: {
    new (settings: BackBlur.Settings): {
        settings: BackBlur.Settings;
        elements: HTMLElement[];
        tmpName: string;
        getElements(): HTMLElement[];
        clearCache(): void;
        update(): void;
        erase(): void;
        draw(): void;
    };
};
