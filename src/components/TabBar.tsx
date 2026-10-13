import { NavLink } from 'react-router-dom';

export function TabBar() {
  return (
    <nav className="tab-bar">
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/add">Add</NavLink>
      <NavLink to="/profile">Profile</NavLink>
    </nav>
  );
}

export default TabBar;