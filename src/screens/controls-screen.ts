import { getGraphics } from "@src/graphics/graphics";
import { MenuButton } from "@src/ui/items/menu_button";
import { GAME } from "@src/index";
import { MenuScreen } from "@src/screens/menu-screen";
import { MenuLabel } from "@src/ui/items/menu_label";
import { MenuInputSelect } from "@src/ui/items/menu_input_select";
import { ControlKey, DEFAULT_KEYS } from "@src/input/controls";
import { saveSettings, SETTINGS } from "@src/settings";
import p5 from "p5";
import keyCode = p5.keyCode;

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 80;

export class ControlsScreen extends MenuScreen {

    public static readonly ID = 'CONTROLS_SCREEN';

    public inputs: MenuInputSelect[] = [];
    public selectedInput?: MenuInputSelect;
    public selectedInputKey?: ControlKey;

    constructor() {
        super(ControlsScreen.ID);

        const og = getGraphics().OVERLAY;
        this.createBackButton(og.height - 150);
        this.createResetButton(og.height - 275);
        this.createInputSelects();
    }

    createBackButton(y: number) {
        const og = getGraphics().OVERLAY;
        const button = this.addItem(new MenuButton({
            x: og.width/2 - BUTTON_WIDTH/2, y, w: BUTTON_WIDTH, h: BUTTON_HEIGHT,
            text: "Back",
            textColor: 0x000000,
            alignVertical: 'center',
            alignHorizontal: 'center',
        }));
        button.onClickFunction = () => GAME.changePreviousScreen();
    }

    createResetButton(y: number) {
        const og = getGraphics().OVERLAY;
        const button = this.addItem(new MenuButton({
            x: og.width/2 - BUTTON_WIDTH/2, y, w: BUTTON_WIDTH, h: BUTTON_HEIGHT,
            text: "Reset",
            textColor: 0x000000,
            alignVertical: 'center',
            alignHorizontal: 'center',
        }));
        button.onClickFunction = () => {
            SETTINGS.CONTROLS = Object.assign({}, DEFAULT_KEYS);
            saveSettings();

            this.inputs.forEach(input => input.updateText());
        };
    }

    createInputSelects() {
        const og = getGraphics().OVERLAY;
        const propsLabels = { x: og.width / 2 - 25, y: 150, w:225, h: 50 };
        const propsInputs = { x: og.width / 2 + 25, y: 150, w:300, h: 50 };
        const keys = Object.keys(ControlKey);
        const values = Object.values(ControlKey);

        for(let i = 0; i < keys.length; i++) {
            const label = this.addItem(new MenuLabel(propsLabels));
            const input = this.addItem(new MenuInputSelect(propsInputs));

            propsLabels.y += 75;
            propsInputs.y += 75;

            label.text = values[i];
            label.textColor = 0xffffff;
            label.alignVertical = 'center';
            label.alignHorizontal = 'right';

            input.alignHorizontal = 'center';
            input.alignVertical = 'center';
            input.textColor = 0x00;
            input.key = values[i];
            input.updateText();

            input.onClickFunction = () => {
                this.selectedInput = input;
                this.selectedInputKey = values[i];
                this.selectedInput.selected = true;
            };

            this.inputs.push(input);
        }
    }

    handleKeyPressed(keyCode: string) {
        if (this.selectedInput && this.selectedInputKey) {
            SETTINGS.CONTROLS[this.selectedInputKey] = keyCode;
            saveSettings();

            this.selectedInput.updateText();

            this.selectedInput.selected = false;
            this.selectedInput = undefined;
            this.selectedInputKey = undefined;
        }
    }
}