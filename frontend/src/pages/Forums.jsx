import { useState } from 'react';
import ForumList from '../components/forums/ForumList';
import ForumDetail from '../components/forums/ForumDetail';
import { useForums } from '../components/forums/useForums';

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