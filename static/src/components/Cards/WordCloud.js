import React from 'react';
import TagCloud from 'react-tag-cloud';
import randomColor from 'randomcolor';
import { Link } from 'react-router';

export default class WordCloud extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let word_dict = this.props.wordDict || {};

        return (
            <TagCloud
                style={{
                    fontFamily: 'sans-serif',
                    fontSize: 30,
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    color: () => randomColor({hue:'blue'}),
                    padding: 5,
                    width: '100%',
                    height: '50%'
                }}>
                {
                    Object.keys(word_dict).map(word => {
                        let weight = parseFloat(word_dict[word]);
                        let fontSize = Math.floor(weight * 80);
           
                        return <Link key={word} style={{fontSize: fontSize}} to={`/search?q=${word}`}>{word}</Link>
                    })
                }
      </TagCloud>
        );
    }
}