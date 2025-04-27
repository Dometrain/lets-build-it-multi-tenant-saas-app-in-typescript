import React, { useState } from 'react';
import styles from './NewUserForm.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTenantUser } from '../api';
import { TenantUser } from '@common/types/TenantUser';

const NewUserForm: React.FC<{}> = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const queryClient = useQueryClient();
    const addUserMutation = useMutation({
        mutationFn: createTenantUser,
        onMutate: async (user: TenantUser) => {
            await queryClient.cancelQueries({ queryKey: ["users"] });
            queryClient.setQueryData<TenantUser[]>(["users"], oldUsers =>
                [...(oldUsers ?? []),
                    user]
            );
        }
    });

    const onSubmit: React.FormEventHandler = e => {
        e.preventDefault();
        if (email.trim().length === 0 || name.trim().length === 0) return;
        addUserMutation.mutate({
            email,
            name
        });
        setName('');
        setEmail('');
    }

    return <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.inputGroup}>
            <label htmlFor="name">Name: </label>
            <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={e => setName(e.currentTarget.value)}
                required
            />
        </div>
        <div className={styles.inputGroup}>
            <label htmlFor="email">Email: </label>
            <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.currentTarget.value)}
                required
            />
        </div>
        <button type="submit" className={styles.submitButton}>Create</button>
    </form>
}

export default NewUserForm;