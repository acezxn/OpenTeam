import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar";

export const Editor = () => {
    let { graphId } = useParams();
    return (
        <>
            <Navbar />
        </>
    )
}
