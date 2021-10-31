import background from './CSS/aurora_background.png';

const Launch = ({ unlock }) => {
    return (
        <>
        <img src={background} className="LaunchScreen" alt="background" />
        <button onClick={unlock} className="btn-hover color-1">Enter The IceAge</button>
        </>
    );
}

export default Launch;