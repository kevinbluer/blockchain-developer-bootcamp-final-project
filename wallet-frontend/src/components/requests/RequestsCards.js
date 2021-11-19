import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import 'bootstrap/dist/css/bootstrap.min.css';
import css from './Requests.css';


const Cards = (props) => {
   
    return (

      <div className="RequestsCards">
          
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
                <InputGroup className="mb-3" bg="primary">
                    <FormControl
                    onChange={props.onChange1}
                    placeholder={props.placeholder1}
                    />
                </InputGroup>
                <InputGroup className="mb-3" bg="primary">
                    <FormControl
                    onChange={props.onChange1a}
                    placeholder={props.placeholder1a}
                    />
                </InputGroup>
                </Card.Body>
                <Button 
                    variant="warning"
                    onClick={props.onClick1}
                >
                   Request Transaction
                </Button>
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
                <InputGroup className="mb-3" bg="primary">
                    <FormControl
                    onChange={props.onChange2}
                    placeholder={props.placeholder2}
                    />
                </InputGroup>
                </Card.Body>
                <Button 
                    variant="warning"
                    onClick={props.onClick2}
                >
                   Request to update the Quorum
                </Button>
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
                <InputGroup className="mb-3" bg="primary">
                    <FormControl
                    placeholder={props.placeholder3}
                    onChange={props.onChange3}
                    />
                </InputGroup>
                </Card.Body>
                <Button 
                    variant="warning"
                    onClick={props.onClick3}
                >
                   Request to remove this owner
                </Button>
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
                <Card.Text as="h5">
                    {props.text4}
                </Card.Text><br/>
                <InputGroup className="mb-3" bg="primary">
                    <FormControl
                    placeholder={props.placeholder4}
                    onChange={props.onChange4}
                    />
                </InputGroup>
                </Card.Body>
                <Button 
                    variant="warning"
                    onClick={props.onClick4}
                >
                   Request to add a new owner
                </Button>
            </Card>
            </Col>
        </Row>
    </div>
    );
  }
  

export default Cards;