+++
# -----------------------------------------------------------------------
# Do not edit this file. It is automatically generated by API Documenter.
# -----------------------------------------------------------------------
title = "CircularDataFrame"
keywords = ["grafana","documentation","sdk","@grafana/data"]
type = "docs"
+++

## CircularDataFrame class

This dataframe can have values constantly added, and will never exceed the given capacity

<b>Signature</b>

```typescript
export declare class CircularDataFrame<T = any> extends MutableDataFrame<T> 
```
<b>Import</b>

```typescript
import { CircularDataFrame } from '@grafana/data';
```
<b>Constructors</b>

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [constructor(options)](#constructor-options) |  | Constructs a new instance of the <code>CircularDataFrame</code> class |

### constructor(options)

Constructs a new instance of the `CircularDataFrame` class

<b>Signature</b>

```typescript
constructor(options: CircularOptions);
```
<b>Parameters</b>

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | <code>CircularOptions</code> |  |
