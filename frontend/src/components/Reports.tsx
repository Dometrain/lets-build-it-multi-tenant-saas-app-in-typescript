import React, {  } from 'react';
import styles from './Reports.module.css';
import { ReportData } from '@common/types/ReportData';
type Props = {
    reports: ReportData
}

const Reports: React.FC<Props> = props => {

    return <div className={styles.container}>
        <dl>
            <dt>Note Count</dt>
            <dd>{props.reports.noteCount}</dd>
        </dl>
        <dl>
            <dt>Most Notable User</dt>
            <dd>{props.reports.mostNotableUser}</dd>
        </dl>
    </div>
}

export default Reports;
