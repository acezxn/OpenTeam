export const TeamView = (props) => {
    return (
        <div style={{ margin: 10 }}>
            <h1>{props.teamTitle}</h1>
            <h1>{props.teamDescription}</h1>
        </div>
    )
}