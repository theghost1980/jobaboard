import React from 'react'
import { useStaticQuery, graphql, Link, navigate } from "gatsby"

const Menucats = (props) => {
    const { menuClicked } = props;

    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            append_menu: allMongodbGatsbyCategories(sort: {fields: name}) {
            edges {
                node {
                    active
                    id
                    thumb
                    image
                    name
                    query
                    sub_category
                    subtitle
                    title
                }
            }
            }
        }
    `);
    //end grapqhql queries

    return (
            <ul className={`menuBottomNavUl ${menuClicked ? 'menuCatsOverFixeDiv' : 'justbackgroundOrange'}`}>
                {
                data.append_menu.edges.map(({ node: itemM}) => {
                    return (
                        itemM.active ?
                        <li key={`${itemM.id}-${itemM.query}`} className="ulParent">
                            <div key={`${itemM.id}-ULDIV`}>{itemM.name}</div>
                            <ul className="subMenuCatUL" key={`${itemM.id}-ULJAB`}>
                            {
                                itemM.sub_category.map(subItem => {
                                return (
                                    <li key={`${itemM.id}-${subItem}`} className="normalTextSmall">
                                        <Link onClick={() => navigateToApp("explore")} to={`/explore?category=${itemM.name}|sub_category=${subItem}`} className="subCatLink">
                                            {subItem}
                                        </Link>
                                    </li>
                                )
                                })
                            }
                            </ul>
                        </li>
                        : null
                    )
                })
                }
            </ul>
    )
}

export default Menucats;
