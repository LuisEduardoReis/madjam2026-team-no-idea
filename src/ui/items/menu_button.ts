import { MenuLabel, type MenuLabelProps } from '@src/ui/items/menu_label';

export type MenuButtonProps = MenuLabelProps;

export class MenuButton extends MenuLabel {
    constructor(props: MenuButtonProps) {
        super(props);
    }

    draw() {
        this.drawBackground();
        super.draw();
    }
}