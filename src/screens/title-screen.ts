import { getGraphics } from "@src/graphics/graphics";
import { MenuButton } from "@src/ui/items/menu_button";
import { GAME, p } from "@src/index";
import { WorldScreen } from "@src/screens/world-screen";
import { MenuScreen } from "@src/screens/menu-screen";
import { SettingsScreen } from "@src/screens/settings-screen";
import { MenuLabel } from "@src/ui/items/menu_label";
import { ControlsScreen } from "@src/screens/controls-screen";
import {PrefaceScreen} from "@src/screens/preface-screen";
import type {Texture} from "@src/graphics/texture";
import {getTexture} from "@src/graphics/textures";
import { map } from "@src/util";
import type {World} from "@src/world/world";
import {buildWorld} from "@src/tiled/world-builder";
import {drawWorld} from "@src/graphics/world-renderer";
import {drawEntities} from "@src/graphics/sprites-renderer";

const BUTTON_WIDTH = 300;
const BUTTON_HEIGHT = 80;

export class TitleScreen extends MenuScreen {

    public static readonly ID = 'TITLE_SCREEN';

    public playButton: MenuButton;
    public titleTexture: Texture;
    public titleWorld: World;

    constructor() {
        super(TitleScreen.ID);

        const og = getGraphics().OVERLAY;
        this.playButton = this.createPlayButton(og.height - 350);
        this.createSettingsButton(og.height - 250);
        this.createControlsButton(og.height - 150);

        this.background = false;
        this.titleTexture = getTexture("Title Screen");
        this.titleWorld = buildWorld("map0");
        if (this.titleWorld.player) this.titleWorld.player.visible = false;
    }

    show() {
        if (GAME.hasStartedPlaying) {
            this.playButton.text = "Continue";
        } else {
            this.playButton.text = "Play";
        }
    }

    update(delta: number) {
        super.update(delta);

        if (this.titleWorld.player) {
            this.titleWorld.player.dir = GAME.time / 6;
        }
    }

    draw() {
        super.draw();

        drawWorld(this.titleWorld);
        drawEntities(this.titleWorld);

        const og = getGraphics().OVERLAY;
        const tw = this.titleTexture.width * 4;
        const th = this.titleTexture.height * 4;
        const tx = og.width/2 - tw/2;
        const ty = map(this.timer, 0, 1, -th, og.height * 0.33 - th/2, true);
        og.image(this.titleTexture.raw, tx,ty, tw,th);
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