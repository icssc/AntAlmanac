import { useState, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { ColorLens } from '@mui/icons-material';
import { IconButton, Popover } from '@mui/material';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
// import { changeCourseColor, changeCustomEventColor } from '$lib/AppStoreActions';
import { useAppStore } from '$lib/stores/global';

interface ColorPickerProps {
  color: string;
  analyticsCategory: string;

  /**
   * If true, this object has a customEventID. If false, this object has a term and sectionCode.
   */
  isCustomEvent: boolean;
  /**
   * Not undefined when isCustomEvent is true
   */
  customEventID?: number;

  /**
   * Not undefined  when isCustomEvent is false
   */
  term?: string;

  /**
   * Not undefined  when isCustomEvent is false
   */
  sectionCode?: string;
}

export default function ColorPicker(props: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [color, setColor] = useState(props.color);

  const {} = useAppStore((state) => ({
    changeCustomEventColor: state.changeCustomEventColor,
    changeCourseColor: state.changeCourseColor,
  }));

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    logAnalytics({
      category: props.analyticsCategory,
      action: analyticsEnum.calendar.actions.CHANGE_COURSE_COLOR,
    });
  }

  function handleClose(event: Event) {
    event.stopPropagation && event.stopPropagation();
    setAnchorEl(null);
  }

  function handleColorChange(newColor: ColorResult) {
    setColor(newColor.hex);
    if (props.isCustomEvent && props.customEventID) {
      changeCustomEventColor(props.customEventID, color);
    } else if (props.sectionCode && props.term) {
      changeCourseColor(props.sectionCode, color, props.term);
    }
  }

  useEffect(() => {
    let colorPickerId = '';
    if (props.isCustomEvent && props.customEventID) {
      colorPickerId = props.customEventID.toString();
    } else if (props.sectionCode) {
      colorPickerId = props.sectionCode;
    } else throw new Error("Colorpicker custom component wasn't supplied a custom event id or a section code.");

    // AppStore.registerColorPicker(colorPickerId, updateColor);

    return () => {
      let colorPickerId = '';
      if (props.isCustomEvent && props.customEventID) {
        colorPickerId = props.customEventID.toString();
      } else if (props.sectionCode) {
        colorPickerId = props.sectionCode;
      } else throw new Error("Colorpicker custom component wasn't supplied a custom event id or a section code.");

      // AppStore.unregisterColorPicker(colorPickerId, updateColor);
    };
  }, [props.color, props.isCustomEvent, props.customEventID, props.sectionCode]);

  return (
    <>
      <IconButton style={{ color }} onClick={handleClick} size="large">
        <ColorLens fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <SketchPicker color={color} onChange={handleColorChange} />
      </Popover>
    </>
  );
}
