import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import 'bootstrap/dist/css/bootstrap.min.css';
import css from './CreateWallet.css';

const CreateWalletCards = (props) => {
    return (

      <div className="CreateWalletCards">
        <Row xs={1}>
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
                        onChange={props.onChange2}
                        placeholder={props.placeholder2}
                    />
                </InputGroup>
                <InputGroup className="mb-3" bg="primary">
                    <FormControl
                        onChange={props.onChange3}
                        placeholder={props.placeholder3}
                    />
                </InputGroup>
                <InputGroup className="mb-3" bg="primary">
                    <FormControl
                        onChange={props.onChange4}
                        placeholder={props.placeholder4}
                    />
                </InputGroup>
                </Card.Body>
                <Button 
                    variant="success"
                    onClick={props.onClick}
                >
                   Create Safe
                </Button>
             </Card>
            </Col>
        </Row>
    </div>
    );
  }
  

export default CreateWalletCards;