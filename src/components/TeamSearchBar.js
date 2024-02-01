import { IconButton, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

export const TeamSearchBar = (props) => {
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();

    const updateSearchText = (event) => {
        setSearchText(event.target.value);
    }
    const handleSearch = (event) => {
        event.preventDefault();
        if (searchText !== "") {
            navigate(`/search/${searchText}`);
        }
    }

    return (
        <form onSubmit={handleSearch}>
            <TextField
                variant="outlined"
                placeholder="Type to search teams..."
                size="small"
                onChange={updateSearchText}
                defaultValue={props.defaultValue}
                style={{ width: "calc(100% - 40px)" }} />
            <IconButton type="submit" aria-label="search">
                <SearchIcon />
            </IconButton>
        </form>
    )
}