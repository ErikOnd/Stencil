import clsx from "clsx";
import type { CSSProperties, HTMLAttributes } from "react";
import checkIcon from "../../../public/assets/icons/check.svg";
import chevronLeftIcon from "../../../public/assets/icons/chevron-left.svg";
import clockIcon from "../../../public/assets/icons/clock.svg";
import copyIcon from "../../../public/assets/icons/copy.svg";
import gridIcon from "../../../public/assets/icons/grid.svg";
import logoutIcon from "../../../public/assets/icons/logout.svg";
import menuIcon from "../../../public/assets/icons/menu.svg";
import plusIcon from "../../../public/assets/icons/plus.svg";
import searchIcon from "../../../public/assets/icons/search.svg";
import settingsIcon from "../../../public/assets/icons/settings.svg";
import sparkleIcon from "../../../public/assets/icons/sparkle.svg";
import starFilledIcon from "../../../public/assets/icons/star-filled.svg";
import starIcon from "../../../public/assets/icons/star.svg";
import trashIcon from "../../../public/assets/icons/trash.svg";
import variableIcon from "../../../public/assets/icons/variable.svg";
import styles from "./Icon.module.scss";

export type IconName =
	| "check"
	| "chevronLeft"
	| "clock"
	| "copy"
	| "grid"
	| "logout"
	| "menu"
	| "plus"
	| "search"
	| "settings"
	| "sparkle"
	| "star"
	| "trash"
	| "variable";

type Props = Omit<HTMLAttributes<HTMLSpanElement>, "color" | "style"> & {
	name: IconName;
	size?: number;
	color?: string;
	fill?: string;
	stroke?: string;
};

type SvgAsset = string | { src: string };

const iconSources: Record<IconName, SvgAsset> = {
	check: checkIcon,
	chevronLeft: chevronLeftIcon,
	clock: clockIcon,
	copy: copyIcon,
	grid: gridIcon,
	logout: logoutIcon,
	menu: menuIcon,
	plus: plusIcon,
	search: searchIcon,
	settings: settingsIcon,
	sparkle: sparkleIcon,
	star: starIcon,
	trash: trashIcon,
	variable: variableIcon,
};

export function iconUrl(asset: SvgAsset) {
	return typeof asset === "string" ? asset : asset.src;
}

export function Icon({
	name,
	size = 17,
	color,
	fill,
	stroke,
	className,
	"aria-label": ariaLabel,
	...props
}: Props) {
	const source = name === "star" && fill && fill !== "none" ? starFilledIcon : iconSources[name];
	const iconColor = color ?? (stroke && stroke !== "none" ? stroke : fill && fill !== "none" ? fill : "currentColor");

	return (
		<span
			aria-hidden={ariaLabel ? undefined : true}
			aria-label={ariaLabel}
			role={ariaLabel ? "img" : undefined}
			className={clsx(styles.icon, className)}
			{...props}
			style={{
				"--icon-url": `url("${iconUrl(source)}")`,
				"--icon-size": `${size}px`,
				"--icon-color": iconColor,
			} as CSSProperties}
		/>
	);
}
