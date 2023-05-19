import { Categories } from "../utils/constants";


export default Object.values(Categories).map(value => ({
    title: value
}))
