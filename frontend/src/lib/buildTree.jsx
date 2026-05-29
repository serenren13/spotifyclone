export function buildTree(comments) {
    const map = {};
    const roots = [];
    comments.forEach(c => (map[c.id] = { ...c, replies: [] }));
    comments.forEach(c => {
        if (c.parentId) map[c.parentId]?.replies.push(map[c.id]);
        else roots.push(map[c.id]);
    });
    return roots;
}