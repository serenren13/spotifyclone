import { useState } from 'react';
import ForumList from '../features/forums/ForumList';
import ForumDetail from '../features/forums/ForumDetail';
import { useForums } from '../features/forums/useForums';

export default function Forums() {
    const [selectedForum, setSelectedForum] = useState(null);
    const { handleDeleteForum, handleLike } = useForums();

    if (selectedForum) {
        return (
            <ForumDetail
                forum={selectedForum}
                onBack={() => setSelectedForum(null)}
                onDelete={(id) => {
                    handleDeleteForum(id);
                    setSelectedForum(null);
                }}
                onLike={handleLike}
                onForumUpdated={(updated) => setSelectedForum(updated)}
            />
        );
    }

    return <ForumList onSelect={setSelectedForum} />;
}
