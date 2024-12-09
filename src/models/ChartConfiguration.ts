import { ChartType } from "chart.js";
export class ChartConfiguration
{
	public DataSets: Array<any> = new Array<any>();
	public Labels: Array<any> = new Array<any>();
	public Options: any = null;
	public ShowLegend: boolean = false;
	public ChartType: ChartType = "doughnut";
	public Height: number = 200;
}
