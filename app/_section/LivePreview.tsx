import React, { useEffect, useMemo, useState } from "react";
import { RadioState } from "../types";
import { clamp, norm } from "@/components/shared/color/colorUtils";
import { SYSTEM_FONTS } from "@/components/shared/typography/fontConstants";

export default function LivePreview({
  state,
  resetKey = 0,
}: {
  state: RadioState;
  resetKey?: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const transition = `all ${state.transitionDuration}ms ${state.transitionEasing}`;
  const descriptionId = state.descriptionText ? "radio-preview-description" : undefined;
  const helperId = state.helperText ? "radio-preview-helper" : undefined;
  const errorId = state.errorText ? "radio-preview-error" : undefined;
  const successId = state.successText ? "radio-preview-success" : undefined;

  // Construct Font Family
  const fontFamily =
    state.fontBucket === "google"
      ? state.googleFontFamily
      : SYSTEM_FONTS[state.systemFontIdx]?.css || "inherit";

  const parsedShadow = norm(state.shadowColor);
  const shadowMatch = parsedShadow.ok ? parsedShadow.rgb.match(/\d+/g) : null;
  const shadowColor =
    shadowMatch && shadowMatch.length >= 3
      ? `rgba(${shadowMatch[0]}, ${shadowMatch[1]}, ${shadowMatch[2]}, ${clamp(state.shadowOpacity, 0, 1)})`
      : `rgba(0, 0, 0, ${clamp(state.shadowOpacity, 0, 1)})`;
  const boxShadow = state.shadowEnabled
    ? `${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${state.shadowSpread}px ${shadowColor}`
    : "none";
  const selectedValue = useMemo(() => {
    if (state.options.some((opt) => opt.value === state.selectedValue)) {
      return state.selectedValue;
    }
    return state.options.find((opt) => !opt.disabled)?.value ?? "";
  }, [state.options, state.selectedValue]);

  useEffect(() => {
    setHoveredIndex(-1);
    setFocusedIndex(-1);
  }, [resetKey]);

  return (
    <div
      className="flex items-center justify-center p-8"
      style={{ minHeight: 300 }}
    >
      <div
        role={state.role || "radiogroup"}
        aria-label={state.ariaLabel || state.name}
        aria-required={state.ariaRequired || undefined}
        aria-describedby={[
          descriptionId,
          helperId,
          errorId,
          successId,
          state.ariaDescribedBy,
        ]
          .filter(Boolean)
          .join(" ") || undefined}
        style={{
          display: "flex",
          flexDirection: state.orientation === "horizontal" ? "row" : "column",
          gap: state.gap,
        }}
        dir={state.dir}
        lang={state.lang || undefined}
      >
        {state.options.map((opt, idx) => {
          const isSelected = selectedValue === opt.value;
          const isHovered = hoveredIndex === idx && !opt.disabled;
          const isFocused = focusedIndex === idx && !opt.disabled;
          const dotAnim: React.CSSProperties =
            state.animationType === "scale"
              ? {
                  transform: isSelected ? "scale(1)" : "scale(0)",
                  opacity: isSelected ? 1 : 0,
                }
              : state.animationType === "fade"
                ? { opacity: isSelected ? 1 : 0 }
                : {};
          return (
            <label
              key={idx}
              onPointerEnter={() => setHoveredIndex(idx)}
              onPointerLeave={() => setHoveredIndex(-1)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                flexDirection:
                  state.labelPosition === "left" ? "row-reverse" : "row",
                gap: state.labelGap,
                cursor: opt.disabled ? state.disabledCursor : "pointer",
                opacity: opt.disabled ? state.disabledOpacity : 1,
              }}
              >
              <input
                id={`${state.id || state.name}-${opt.value}`}
                type="radio"
                name={state.name}
                value={opt.value}
                checked={isSelected}
                onChange={() => {}}
                onFocus={() => setFocusedIndex(idx)}
                onBlur={() => setFocusedIndex(-1)}
                disabled={opt.disabled}
                required={state.ariaRequired || undefined}
                readOnly
                dir={state.dir}
                lang={state.lang || undefined}
                title={state.title || undefined}
                tabIndex={state.tabIndex}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 0,
                  height: 0,
                }}
              />
              <span
                className="radio-outer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: state.outerSize,
                  height: state.outerSize,
                  borderWidth: state.outerBorderWidth,
                  borderStyle: state.outerBorderStyle,
                  borderColor: isHovered
                    ? state.hoverBorderColor
                    : isSelected
                    ? state.selectedOuterBorderColor
                    : state.outerBorderColor,
                  borderRadius: "50%",
                  backgroundColor: isHovered
                    ? state.hoverBgColor
                    : isSelected
                    ? state.selectedOuterBgColor
                    : state.outerBgColor,
                  boxShadow: isFocused
                    ? `0 0 0 ${state.focusRingWidth}px ${state.focusRingColor}`
                    : boxShadow,
                  transition,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: state.dotSize,
                    height: state.dotSize,
                    borderRadius: "50%",
                    backgroundColor: state.dotColor,
                    transition,
                    ...dotAnim,
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily,
                  fontSize: `${state.labelFontSize}${state.fontSizeUnit}`,
                  fontWeight: state.labelFontWeight,
                  color: state.labelColor,
                  letterSpacing: `${state.labelLetterSpacing}${state.letterSpacingUnit}`,
                  lineHeight: state.labelLineHeight,
                  fontStyle: state.labelFontStyle,
                  textTransform: state.labelTextTransform,
                  textDecoration: state.labelUnderline ? "underline" : "none",
                }}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
        <div className="space-y-1 px-1 text-center text-xs" style={{ maxWidth: 420 }}>
          {state.descriptionText ? (
            <p id={descriptionId} style={{ color: state.descriptionColor }}>
              {state.descriptionText}
            </p>
          ) : null}
          {state.helperText ? (
            <p id={helperId} style={{ color: state.helperColor }}>
              {state.helperText}
            </p>
          ) : null}
          {state.errorText ? (
            <p id={errorId} style={{ color: state.errorColor }}>
              {state.errorText}
            </p>
          ) : null}
          {state.successText ? (
            <p id={successId} style={{ color: state.successColor }}>
              {state.successText}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
