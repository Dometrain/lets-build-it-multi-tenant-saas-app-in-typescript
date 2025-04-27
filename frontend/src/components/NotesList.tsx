import React, { useContext, useState } from 'react';
import styles from './NotesList.module.css';
import { Note } from '@common/types/Note';
import { CircleUser, SendHorizontal } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertNote } from '../api';
import { nanoid } from 'nanoid'
import { AuthContext } from '../contexts/AuthContext';

type Props = {
    notes: Note[]
}

const NotesList: React.FC<Props> = props => {
    const [newNoteValue, setNewNoteValue] = useState('');
    const queryClient = useQueryClient();
    const { currentUser } = useContext(AuthContext);

    const addNoteMutation = useMutation({
        mutationFn: upsertNote,
        onMutate: async (newNote: Note) => {
            await queryClient.cancelQueries({ queryKey: ["notes"] });
            queryClient.setQueryData<Note[]>(["notes"], oldNotes =>
                [...(oldNotes ?? []),
                    newNote]
            );
        }
    });

    const onClickCreate = () => {
        if (newNoteValue.trim().length === 0) return;

        addNoteMutation.mutate({ 
            content: newNoteValue, 
            author: currentUser?.name, 
            id: nanoid() 
        });
        setNewNoteValue('');
    }

    return <ul className={styles.list}>
        {props.notes.map(note => <li key={note.id} className={styles.note}>
            <p>{note.content}</p>
            <footer><CircleUser />{note.author}</footer>
        </li>)}
        <li className={styles.note}>
            <textarea
                value={newNoteValue}
                onChange={e => setNewNoteValue(e.currentTarget.value)}
                placeholder="New note..."
                rows={5}
            />
            <footer className={styles.newnotefooter}>
                <button onClick={onClickCreate}>
                    <SendHorizontal />
                </button>
            </footer>
        </li>
    </ul>


        }

export default NotesList;
