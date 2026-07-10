// Dev-only (see entry.browser): every library css module, imported into the
// client graph so vite injects its <style data-vite-dev-id> copies up front.
// plugin-rsc's server-rendered css <link>s have a removal lifecycle (dedup on
// hydration); awaiting this module before hydrateRoot guarantees the injected
// styles exist before any link can be retired — no unstyled window, and library
// css HMR keeps working natively on these copies. Add new components here.
import "@brijbyte/md3-react/badge/Badge.module.css";
import "@brijbyte/md3-react/bottom-sheet/BottomSheet.module.css";
import "@brijbyte/md3-react/button/Button.module.css";
import "@brijbyte/md3-react/button-group/ButtonGroup.module.css";
import "@brijbyte/md3-react/card/Card.module.css";
import "@brijbyte/md3-react/checkbox/Checkbox.module.css";
import "@brijbyte/md3-react/chip/Chip.module.css";
import "@brijbyte/md3-react/circular-progress/CircularProgress.module.css";
import "@brijbyte/md3-react/dialog/Dialog.module.css";
import "@brijbyte/md3-react/divider/Divider.module.css";
import "@brijbyte/md3-react/fab/Fab.module.css";
import "@brijbyte/md3-react/icon-button/IconButton.module.css";
import "@brijbyte/md3-react/linear-progress/LinearProgress.module.css";
import "@brijbyte/md3-react/list/List.module.css";
import "@brijbyte/md3-react/loading-indicator/LoadingIndicator.module.css";
import "@brijbyte/md3-react/menu/Menu.module.css";
import "@brijbyte/md3-react/radio/Radio.module.css";
import "@brijbyte/md3-react/ripple/ripple.module.css";
import "@brijbyte/md3-react/side-sheet/SideSheet.module.css";
import "@brijbyte/md3-react/slider/Slider.module.css";
import "@brijbyte/md3-react/snackbar/Snackbar.module.css";
import "@brijbyte/md3-react/split-button/SplitButton.module.css";
import "@brijbyte/md3-react/switch/Switch.module.css";
import "@brijbyte/md3-react/tabs/Tabs.module.css";
import "@brijbyte/md3-react/text-field/TextField.module.css";
import "@brijbyte/md3-react/toolbar/Toolbar.module.css";
import "@brijbyte/md3-react/tooltip/Tooltip.module.css";
import "@brijbyte/md3-react/typography/Typography.module.css";
