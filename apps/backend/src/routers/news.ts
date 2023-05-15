import { router, procedure } from '../trpc';
import NewsModel, { News } from '$models/News';

const newsRouter = router({
    /**
     * return all news
     */
    findAll: procedure.query(async () => {
        // return await NewsModel.find({}) as News[];
        return (await NewsModel.find({})) as News[];
    }),
});

export default newsRouter;
