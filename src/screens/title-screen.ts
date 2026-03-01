import { getGraphics } from "@src/graphics/graphics";
import { MenuButton } from "@src/ui/items/menu_button";
import { GAME, p } from "@src/index";
import { WorldScreen } from "@src/screens/world-screen";
import { MenuScreen } from "@src/screens/menu-screen";
import { SettingsScreen } from "@src/screens/settings-screen";
import { MenuLabel } from "@src/ui/items/menu_label";
import { ControlsScreen } from "@src/screens/controls-screen";
import {PrefaceScreen} from "@src/screens/preface-screen";

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 80;

export class TitleScreen extends MenuScreen {

    public static readonly ID = 'TITLE_SCREEN';

    public playButton: MenuButton;

    constructor() {
        super(TitleScreen.ID);

        const og = getGraphics().OVERLAY;
        this.createGameTitle(300);
        this.playButton = this.createPlayButton(og.height - 350);
        this.createSettingsButton(og.height - 250);
        this.createControlsButton(og.height - 150);
    }

    show() {
        if (GAME.hasStartedPlaying) {
            this.playButton.text = "Continue";
        } else {
            this.playButton.text = "Play";
        }
    }

    createGameTitle(y: number) {
        const og = getGraphics().OVERLAY;
        const button = this.addItem(new MenuLabel({
            x: og.width/2 - BUTTON_WIDTH/2, y, w: BUTTON_WIDTH, h: BUTTON_HEIGHT,
            text: "Game Title",
            fontSize: 150,
            textColor: 0xffffff,
            alignVertical: 'center',
            alignHorizontal: 'center',
        }));
        button.onClickFunction = () => GAME.changeScreen(WorldScreen.ID);
    }

    createPlayButton(y: number) {
        const og = getGraphics().OVERLAY;
        const button = this.addItem(new MenuButton({
            x: og.width/2 - BUTTON_WIDTH/2, y, w: BUTTON_WIDTH, h: BUTTON_HEIGHT,
            text: "Play",
            textColor: 0x000000,
            alignVertical: 'center',
            alignHorizontal: 'center',
        }));
        button.onClickFunction = () => {
            if (GAME.hasStartedPlaying) {
                GAME.changeScreen(WorldScreen.ID);
            } else {
                GAME.changeScreen(PrefaceScreen.ID, { fadeInDelay: 3 });
            }
        };
        return button;
    }

    createSettingsButton(y: number) {
        const og = getGraphics().OVERLAY;
        const button = this.addItem(new MenuButton({
            x: og.width/2 - BUTTON_WIDTH/2, y, w: BUTTON_WIDTH, h: BUTTON_HEIGHT,
            text: "Settings",
            textColor: 0x000000,
            alignVertical: 'center',
            alignHorizontal: 'center',
        }));
        button.onClickFunction = () => GAME.changeScreen(SettingsScreen.ID);
    }

    createControlsButton(y: number) {
        const og = getGraphics().OVERLAY;
        const button = this.addItem(new MenuButton({
            x: og.width/2 - BUTTON_WIDTH/2, y, w: BUTTON_WIDTH, h: BUTTON_HEIGHT,
            text: "Controls",
            textColor: 0x000000,
            alignVertical: 'center',
            alignHorizontal: 'center',
        }));
        button.onClickFunction = () => GAME.changeScreen(ControlsScreen.ID);
    }
}