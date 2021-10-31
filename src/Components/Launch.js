import background from './CSS/Aurora_background.png';

const Launch = ({ unlock }) => {
    return (
        <>
        <img src={background} className="LaunchScreen" alt="background" />
        <button onClick={unlock} class="btn-hover color-1">Enter The IceAge</button>
        </>
    );
}

export default Launch;