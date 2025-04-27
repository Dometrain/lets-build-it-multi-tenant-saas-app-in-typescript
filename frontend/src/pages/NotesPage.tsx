import { useQuery } from '@tanstack/react-query';
import styles from './page.module.css';
import { fetchAllNotes } from '../api';
import NotesList from '../components/NotesList';

const NotesPage: React.FC = () => {
  const { data: notes } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchAllNotes,
  });

  return <div className={styles.page}>
    <h1>Notes</h1>
    { notes ? <NotesList notes={notes} /> : 'Loading...' }
  </div>
};

export default NotesPage;
