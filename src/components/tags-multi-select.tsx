import { MultiSelect } from './multi-select'
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react';
import { GET_TAGS } from '@/graphql/tags/queries';
import { FormDescription } from './ui/form';

const TagsMultiSelect = ({ selected, setSelectedTags }) => {
    const {data, loading, error} = useQuery(GET_TAGS);
    const [transformedData, setTransformedData] = useState([])
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if(!data || !data.getTags) return;
        const transformedData = data.getTags.map((tag: any) => ({
            label: tag.tag,
            value: tag.id,
        }));
        setTransformedData(transformedData);
    }, [data]);

  return (
    <>
    <MultiSelect
        hideSelectAllButton={true}
        options={transformedData}
        onValueChange={setSelectedTags}
        defaultValue={selected}
        setErrorMessage={setErrorMessage}
        maxSelectable={10}
        placeholder={loading ? "Fetching tags" : "Select tags"}
        variant="inverted"
        animation={2}
        maxCount={3}
    />
    {errorMessage && <p className='text-[0.8rem] text-destructive'>{errorMessage}</p>}
    </>
  )
}

export default TagsMultiSelect