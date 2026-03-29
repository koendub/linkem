
export interface LinkCondition {
  type: 'url_start' | 'url_contains' | 'xpath_match' | 'value_match';
  value: string;
}
