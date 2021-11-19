import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import 'bootstrap/dist/css/bootstrap.min.css';
import css from './Information.css';

const InformationCards = (props) => {
   
    return (



      <div className="InformationCards">
        <Row xs={4}>
            <Col>
            <Card
            bg="light"
            border="info"
            text="black"
            >
                <Card.Header as="h4">{props.title1}</Card.Header>
                <Card.Body>
                <Card.Text as="h5">
                    {props.text1}
                </Card.Text><br/>
                </Card.Body>
             </Card>
            </Col>
                <Col>
            <Card
                bg="light"
                border="info"
                text="black"
            >
                <Card.Header as="h4">{props.title2}</Card.Header>
                <Card.Body>
                <Card.Text as="h5">
                    {props.text2}
                </Card.Text><br/>
                </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card
                bg="light"
                border="info"
                text="black"
            >
                <Card.Header as="h4">{props.title3}</Card.Header>
                <Card.Body>
                <Card.Text as="h5">
                    {props.text3}
                </Card.Text><br/>
                </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card
                bg="light"
                border="info"
                text="black"
            >
                <Card.Header as="h4">{props.title4}</Card.Header>
                <Card.Body>
                <Card.Text as="h8">
                    {props.text4}
                </Card.Text><br/>
                </Card.Body>
            </Card>
            </Col>
        </Row>
    </div>
    );
  }
  

export default InformationCards;