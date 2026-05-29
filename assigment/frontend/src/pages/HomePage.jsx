import { Link } from "react-router-dom"

export default function HomePage() {
    return (
        <div className="homepage">

            <div className="primary-card">

                <h1>Creative Workflow Tracker</h1>

                <p>
                    Organize projects, collaborate with your team,
                    manage tasks, discussions, attachments and notifications
                    from one place.
                </p>

                <Link to="/studios">
                    <button>
                        Start Creating
                    </button>
                </Link>

            </div>

        </div>
    )
}