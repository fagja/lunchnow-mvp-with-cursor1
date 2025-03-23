-- SQLを実行するための関数
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS text AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;