import { MultiSelect } from './multi-select'
import { useEffect, useState } from 'react';

const UsersMultiSelect = ({ data, loading, selected, setSelectedUsers }) => {
    const [transformedData, setTransformedData] = useState([])
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if(!data || !data.getUsersByOrg) return;
        const transformedData = data.getUsersByOrg.map((user: any) => ({
            ...user,
            label: `${user.lastName}, ${user.firstName}`,
            value: user.id,
        }));
        setTransformedData(transformedData);
    }, [data]);

  return (
    <MultiSelect
        options={transformedData}
        onValueChange={setSelectedUsers}
        defaultValue={selected}
        setErrorMessage={setErrorMessage}
        maxSelectable={999}
        placeholder={loading ? "Fetching users" : "Select users to assign"}
        variant="inverted"
        animation={2}
        maxCount={3}
    />
  )
}

export default UsersMultiSelect