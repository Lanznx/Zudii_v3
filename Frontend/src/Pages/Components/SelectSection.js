import * as React from "react";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, sections, theme) {
  return {
    fontWeight:
      sections.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function SelectSection(props) {
  const theme = useTheme();
  const { sections, setSections, provinces, regions } = props;
  const [canSelect, setCanSelect] = React.useState(false);

  React.useEffect(() => {
    if (regions.length !== 0) {
      setCanSelect(true);
    }
    setSections([]);
  }, [regions]);

  if (!canSelect) {
    return (
      <FormControl sx={{ width: 200, mt: 1 }} disabled>
        <InputLabel id="demo-multiple-name-label">
          行政區（預設全選）
        </InputLabel>
        <Select sx={{ width: "250px" }} MenuProps={MenuProps}></Select>
      </FormControl>
    );
  }

  const city = provinces["cities"].find((city) => city.name === regions[0]);

  const names = city["sections"].map((section) => {
    return section["name"];
  });
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSections(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  return (
    <FormControl sx={{ width: 200, mt: 1 }} disabled={!canSelect}>
      <InputLabel id="demo-multiple-name-label">行政區（預設全選）</InputLabel>
      <Select
        defaultValue=""
        sx={{ width: "250px" }}
        labelId="demo-multiple-name-label"
        id="demo-multiple-name"
        multiple
        value={sections}
        onChange={handleChange}
        input={<OutlinedInput label="Name" />}
        MenuProps={MenuProps}
      >
        {names.map((name) => (
          <MenuItem
            key={name}
            value={name}
            style={getStyles(name, sections, theme)}
          >
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
