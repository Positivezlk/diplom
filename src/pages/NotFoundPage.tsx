import { Link } from 'react-router-dom';
export const NotFoundPage = () => <div className="grid min-h-screen place-items-center"><div className="card text-center"><h1 className="text-4xl font-bold">404</h1><Link to="/dashboard" className="text-indigo-500">На главную</Link></div></div>;
