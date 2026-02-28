import { AbstractScreen } from "@src/screens/abstract-screen";
import type { MenuItem } from "@src/ui/items/menu_item";
import { getGraphics, setResolution } from "@src/graphics/graphics";
import { MAX_VIEW_TURN_RATE, MIN_VIEW_TURN_RATE, PIXELS_RESOLUTIONS, saveSettings, SETTINGS } from "@src/settings";
import { MenuButton } from "@src/ui/items/menu_button";
import { GAME } from "@src/index";
import { map } from "@src/util";
import { MenuLabel } from "@src/ui/items/menu_label";
import { MenuRadioButton } from "@src/ui/items/menu_radio_button";
import { MenuCheckbox } from "@src/ui/items/menu_checkbox";
import { MenuSlider } from "@src/ui/items/menu_slider";
import { MenuScreen } from "@src/screens/menu-screen";

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 80;

export class SettingsScreen extends MenuScreen {

    public static readonly ID = 'SETTINGS_SCREEN';

    constructor() {
        super(SettingsScreen.ID);

        const x = 550;
        this.createBackButton();
        this.createResolutionRadio(x,200);
        this.createViewBobbingCheckbox(x + 500, 325);
        this.createMusicCheckbox(x + 500, 400);
        this.createTurnSensitivitySlider(x + 500, 500);
    }

    createBackButton() {
        const og = getGraphics().OVERLAY;
        const backButton = this.addItem(new MenuButton({
            x: og.width/2 - BUTTON_WIDTH/2, y:  og.height - 200, w: BUTTON_WIDTH, h: BUTTON_HEIGHT,
            text: "Back",
            textColor: 0x000000,
            alignVertical: 'center',
            alignHorizontal: 'center',
        }));
        backButton.onClickFunction = () => GAME.changePreviousScreen();
    }

    createResolutionRadio(x: number, y: number) {
        this.addItem(new MenuLabel({ x: x + 50, y: y + 50, text: "Resolution:" }));
        const propsButtons = { x: x + 50, y: y + 125, w:50, h: 50, alignVertical: 'top' };
        const propsLabels = { x: x + 125, y: y + 125, w:225, h: 50 };
        const radioButtons: MenuRadioButton[] = [];
        const radioLabels: MenuLabel[] = [];
        for(let i = 0; i < PIXELS_RESOLUTIONS.length; i++) {
            radioLabels.push(this.addItem(new MenuLabel(propsLabels))); propsLabels.y += 75;
            radioButtons.push(this.addItem(new MenuRadioButton(propsButtons))); propsButtons.y += 75;
        }
        radioLabels.forEach((e,i) => {
            const r = PIXELS_RESOLUTIONS[i];
            e.text = `${r.w}x${r.h}`;
            e.link = radioButtons[i];
        });
        radioButtons.forEach((e,i) => {
            e.setSiblings(radioButtons);
            e.setFunction = () => setResolution(i);
        });
        radioButtons[SETTINGS.CURRENT_PIXELS_RESOLUTION].on = true;
    }

    createViewBobbingCheckbox(x: number, y: number) {
        const bobbingCheckbox = this.addItem(new MenuCheckbox({ x: x, y: y, w: 50, h: 50 }));
        const bobbingLabel = this.addItem(new MenuLabel({ x: x + 75, y: y + 5, text: "View bobbing", w: 300, h:50 }));
        bobbingLabel.link = bobbingCheckbox;
        bobbingCheckbox.onShow = () => {
            bobbingCheckbox.on = SETTINGS.VIEW_BOBBING;
        };
        bobbingCheckbox.onClickFunction = () => {
            SETTINGS.VIEW_BOBBING = !SETTINGS.VIEW_BOBBING;
            saveSettings();
            console.log(`View bobbing ${SETTINGS.VIEW_BOBBING ? 'on' : 'off'}`);
        };
    }

    createMusicCheckbox(x: number, y: number) {
        const musicCheckbox = this.addItem(new MenuCheckbox({ x: x, y: y, w: 50, h: 50 }));
        const musicLabel = this.addItem(new MenuLabel({ x: x + 75, y: y + 5, text: "Music", w: 300, h:50 }));
        musicLabel.link = musicCheckbox;
        musicCheckbox.onShow = () => {
            musicCheckbox.on = SETTINGS.MUSIC;
        };
        musicCheckbox.onClickFunction = () => {
            SETTINGS.MUSIC = !SETTINGS.MUSIC;
            saveSettings();
            console.log(`Music ${SETTINGS.MUSIC ? 'on' : 'off'}`);
        };
    }

    createTurnSensitivitySlider(x: number, y: number) {
        this.addItem(new MenuLabel({ x: x, y: y, w: 400, h: 50, text: "Turn sensitivity:" }));
        const slider = this.addItem(new MenuSlider({ x: x, y: y+75, w: 400, h: 50 }));
        slider.onShow = () => {
            slider.value = map(SETTINGS.VIEW_TURN_RATE, MIN_VIEW_TURN_RATE, MAX_VIEW_TURN_RATE, 0,1);
        };
        slider.onUpdateValue = (v) => {
            SETTINGS.VIEW_TURN_RATE = map(v, 0, 1, MIN_VIEW_TURN_RATE, MAX_VIEW_TURN_RATE);
            saveSettings();
        };
    }
}