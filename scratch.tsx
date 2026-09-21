import React from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from './src/components/ui/button';

console.log(renderToString(<Button type="submit" formAction="/foo">Click</Button>));
