import React, { } from 'react';
import styles from './UserTable.module.css';
import { TenantUser } from '@common/types/TenantUser';

type Props = {
    users: TenantUser[]
}

const UserTable: React.FC<Props> = props => {

    return <table className={styles.table}>
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            {props.users.map(user => <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
            </tr>)}
        </tbody>
    </table>
}

export default UserTable;