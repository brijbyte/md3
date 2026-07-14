"use client";

import "./icon-styler.css";

import * as React from "react";
import { FilterChip } from "@/ui/chip";
import { IconButton } from "@/ui/icon-button";
import { Slider } from "@/ui/slider";
import { Switch } from "@/ui/switch";
import { Typography } from "@/ui/typography";
import RestartAltIcon from "@brijbyte/md3-icons/outlined/RestartAlt";
import OutlinedFavorite from "@brijbyte/md3-icons/outlined/Favorite";
import OutlinedFavoriteFill from "@brijbyte/md3-icons/outlined/FavoriteFill";
import OutlinedHome from "@brijbyte/md3-icons/outlined/Home";
import OutlinedHomeFill from "@brijbyte/md3-icons/outlined/HomeFill";
import OutlinedSearch from "@brijbyte/md3-icons/outlined/Search";
import OutlinedSearchFill from "@brijbyte/md3-icons/outlined/SearchFill";
import OutlinedSettings from "@brijbyte/md3-icons/outlined/Settings";
import OutlinedSettingsFill from "@brijbyte/md3-icons/outlined/SettingsFill";
import RoundedFavorite from "@brijbyte/md3-icons/rounded/Favorite";
import RoundedFavoriteFill from "@brijbyte/md3-icons/rounded/FavoriteFill";
import RoundedHome from "@brijbyte/md3-icons/rounded/Home";
import RoundedHomeFill from "@brijbyte/md3-icons/rounded/HomeFill";
import RoundedSearch from "@brijbyte/md3-icons/rounded/Search";
import RoundedSearchFill from "@brijbyte/md3-icons/rounded/SearchFill";
import RoundedSettings from "@brijbyte/md3-icons/rounded/Settings";
import RoundedSettingsFill from "@brijbyte/md3-icons/rounded/SettingsFill";
import SharpFavorite from "@brijbyte/md3-icons/sharp/Favorite";
import SharpFavoriteFill from "@brijbyte/md3-icons/sharp/FavoriteFill";
import SharpHome from "@brijbyte/md3-icons/sharp/Home";
import SharpHomeFill from "@brijbyte/md3-icons/sharp/HomeFill";
import SharpSearch from "@brijbyte/md3-icons/sharp/Search";
import SharpSearchFill from "@brijbyte/md3-icons/sharp/SearchFill";
import SharpSettings from "@brijbyte/md3-icons/sharp/Settings";
import SharpSettingsFill from "@brijbyte/md3-icons/sharp/SettingsFill";

const STYLES = ["outlined", "rounded", "sharp"] as const;
type Style = (typeof STYLES)[number];
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const PREVIEW_ICONS: Record<Style, { unfilled: IconComponent[]; filled: IconComponent[] }> = {
  outlined: {
    unfilled: [OutlinedFavorite, OutlinedHome, OutlinedSearch, OutlinedSettings],
    filled: [OutlinedFavoriteFill, OutlinedHomeFill, OutlinedSearchFill, OutlinedSettingsFill],
  },
  rounded: {
    unfilled: [RoundedFavorite, RoundedHome, RoundedSearch, RoundedSettings],
    filled: [RoundedFavoriteFill, RoundedHomeFill, RoundedSearchFill, RoundedSettingsFill],
  },
  sharp: {
    unfilled: [SharpFavorite, SharpHome, SharpSearch, SharpSettings],
    filled: [SharpFavoriteFill, SharpHomeFill, SharpSearchFill, SharpSettingsFill],
  },
};

const DEFAULT_SIZE = 40;

// Live restyling playground: color/size are plain CSS (currentColor + 1em icons),
// style/fill swap the imported variant — mirroring exactly what a consumer would do.
export default function IconStyler() {
  const [color, setColor] = React.useState<string | null>(null);
  const [size, setSize] = React.useState(DEFAULT_SIZE);
  const [style, setStyle] = React.useState<Style>("outlined");
  const [fill, setFill] = React.useState(false);

  const reset = () => {
    setColor(null);
    setSize(DEFAULT_SIZE);
    setStyle("outlined");
    setFill(false);
  };

  const icons = PREVIEW_ICONS[style][fill ? "filled" : "unfilled"];

  return (
    <section className="icon-styler" aria-label="Icon styling playground">
      <div className="icon-styler-controls">
        <div className="icon-styler-heading">
          <Typography as="h2" variant="headline-small" id="tune-the-set">
            Tune the set
          </Typography>
          <IconButton variant="standard" aria-label="Reset styling" onClick={reset}>
            <RestartAltIcon />
          </IconButton>
        </div>
        <Typography variant="body-medium" className="icon-styler-blurb">
          Icons inherit color and size from the surrounding text — two CSS properties restyle all
          four thousand at once.
        </Typography>

        <div className="icon-styler-row">
          <Typography as="label" variant="label-large" htmlFor="icon-styler-color">
            Color
          </Typography>
          <span className="icon-styler-color">
            <span
              className="icon-styler-swatch"
              style={color ? { backgroundColor: color } : undefined}
            >
              <input
                id="icon-styler-color"
                type="color"
                value={color ?? "#6750a4"}
                onChange={(e) => setColor(e.target.value)}
              />
            </span>
            <Typography as="code" variant="body-medium" className="icon-styler-value">
              {color ?? "currentColor"}
            </Typography>
          </span>
        </div>

        <div className="icon-styler-row">
          <Typography as="span" variant="label-large" id="icon-styler-size">
            Size
          </Typography>
          <Typography as="span" variant="body-medium" className="icon-styler-value">
            {size}px
          </Typography>
        </div>
        <Slider
          aria-labelledby="icon-styler-size"
          min={16}
          max={96}
          step={4}
          value={size}
          onValueChange={(value) => setSize(value as number)}
        />

        <div className="icon-styler-row">
          <Typography as="span" variant="label-large" id="icon-styler-style">
            Style
          </Typography>
          <span className="icon-styler-chips" role="group" aria-labelledby="icon-styler-style">
            {STYLES.map((s) => (
              <FilterChip key={s} pressed={style === s} onPressedChange={(p) => p && setStyle(s)}>
                {s[0].toUpperCase() + s.slice(1)}
              </FilterChip>
            ))}
          </span>
        </div>

        <div className="icon-styler-row">
          <Typography as="label" variant="label-large" htmlFor="icon-styler-fill">
            Filled
          </Typography>
          <Switch id="icon-styler-fill" checked={fill} onCheckedChange={setFill} />
        </div>
      </div>

      <div
        className="icon-styler-preview"
        aria-hidden
        style={{ fontSize: size, color: color ?? undefined }}
      >
        {icons.map((Icon, i) => (
          <span key={i} className="icon-styler-cell">
            <Icon />
          </span>
        ))}
      </div>
    </section>
  );
}
