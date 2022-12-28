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

function getStyles(name, regions, theme) {
  return {
    fontWeight:
      regions.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function SelectRegion(props) {
  const theme = useTheme();
  const { provinces, setRegions, regions } = props;
  const names = provinces["cities"].map((province) => province.name);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setRegions(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  return (
    <div>
      <FormControl sx={{ width: 200, mt: 1 }}>
        <InputLabel id="demo-multiple-name-label">縣市</InputLabel>
        <Select
          defaultValue=""
          sx={{ width: "250px" }}
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          value={regions}
          onChange={handleChange}
          input={<OutlinedInput label="Name" />}
          MenuProps={MenuProps}
        >
          {names.map((name) => (
            <MenuItem
              key={name}
              value={name}
              style={getStyles(name, regions, theme)}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
