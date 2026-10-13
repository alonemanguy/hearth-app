import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import StatusPill from './StatusPill';
import { springs } from '../lib/motion';

type Props = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  status: 'due' | 'overdue' | 'done';
};

export default function TaskRow({ id, icon, title, subtitle, status }: Props) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="task-row"
      onClick={() => navigate(`/detail/${id}`)}
      style={{ cursor: 'pointer' }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      whileHover={reduce ? undefined : { x: 2 }}
      transition={springs.snappy}
    >
      <div className="task-icon">{icon}</div>
      <div className="task-info">
        <div className="task-title">{title}</div>
        <div className="task-subtitle">{subtitle}</div>
      </div>
      <StatusPill status={status} />
    </motion.div>
  );
}