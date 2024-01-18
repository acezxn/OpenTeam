import Navbar from "../components/Navbar";

const NoPage = () => {
    return (
        <>
            <Navbar />
            <div style={{ height: 80 }}></div>
            <div style={{margin: 10}}><h1>Page not found</h1></div>
        </>
    );
}

export default NoPage;